#!/usr/bin/env python
# -*- coding: utf-8 -*-

import re
import signal

from six.moves import queue
from google.cloud.speech.v1beta1 import cloud_speech_pb2
from google.rpc import code_pb2
from grpc.framework.interfaces.face import face
from google.appengine.api.background_thread.background_thread import BackgroundThread

from utils.ssl_channel import make_channel

DEADLINE_SECS = 60 * 3 + 5

def _audio_data_generator(buff):
    """A generator that yields all available data in the given buffer.
    Args:
        buff - a Queue object, where each element is a chunk of data.
    Yields:
        A chunk of data that is the aggregate of all chunks of data in `buff`.
        The function will block until at least one data chunk is available.
    """
    while True:
        # Use a blocking get() to ensure there's at least one chunk of data
        chunk = buff.get()
        if not chunk:
            # A falsey value indicates the stream is closed.
            break
        data = [chunk]

        # Now consume whatever other data's still buffered.
        while True:
            try:
                data.append(buff.get(block=False))
            except queue.Empty:
                break
        yield b''.join(data)



def request_stream(data_stream, rate):
    """Yields `StreamingRecognizeRequest`s constructed from a recording audio
    stream.
    Args:
        data_stream: A generator that yields raw audio data to send.
        rate: The sampling rate in hertz.
    """
    # The initial request must contain metadata about the stream, so the
    # server knows how to interpret it.
    recognition_config = cloud_speech_pb2.RecognitionConfig(
        # There are a bunch of config options you can specify. See
        # https://goo.gl/KPZn97 for the full list.
        encoding='LINEAR16',  # raw 16-bit signed LE samples
        sample_rate=rate,  # the rate in hertz
        # See
        # https://g.co/cloud/speech/docs/best-practices#language_support
        # for a list of supported languages.
        language_code='en-US',  # a BCP-47 language tag
    )
    streaming_config = cloud_speech_pb2.StreamingRecognitionConfig(
        config=recognition_config,
    )

    yield cloud_speech_pb2.StreamingRecognizeRequest(
        streaming_config=streaming_config)

    for data in data_stream:
        # Subsequent requests can all just have the content
        yield cloud_speech_pb2.StreamingRecognizeRequest(audio_content=data)


def listen_print_loop(recognize_stream, callback):
    for resp in recognize_stream:
        if resp.error.code != code_pb2.OK:
            raise RuntimeError('Server error: ' + resp.error.message)

        # Display the transcriptions & their alternatives
        for result in resp.results:
            callback(result.alternatives)

        # Exit recognition if any of the transcribed phrases could be
        # one of our keywords.
        if any(re.search(r'\b(exit|quit)\b', alt.transcript, re.I)
               for result in resp.results
               for alt in result.alternatives):
            callback('Exiting..')
            break


def recognize_audio(buff, rate, callback):
    with cloud_speech_pb2.beta_create_Speech_stub(
        make_channel('speech.googleapis.com', 443)) as service:
        # For streaming audio from the microphone, there are three threads.
        # First, a thread that collects audio data as it comes in
        buffered_audio_data = _audio_data_generator(buff)
        # Second, a thread that sends requests with that data
        requests = request_stream(buffered_audio_data, rate)
        # Third, a thread that listens for transcription responses
        recognize_stream = service.StreamingRecognize(
            requests, DEADLINE_SECS)

        # Exit things cleanly on interrupt
        signal.signal(signal.SIGINT, lambda *_: recognize_stream.cancel())

        # Now, put the transcription responses to use.
        try:
            listen_print_loop(recognize_stream, callback)

            recognize_stream.cancel()
        except face.CancellationError:
            # This happens because of the interrupt handler
            pass

class SoundProcessor(BackgroundThread):
    def __init__(self, buff, rate, callback):
        BackgroundThread.__init__(self)
        self.buff = buff
        self.callback = callback
        self.rate = rate

    def start(self):
        recognize_audio(self.buff, self.rate, self.callback)
