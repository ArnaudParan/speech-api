#!/usr/bin/env python
# -*- coding: utf-8 -*-

import re
import os
import time

from google.cloud import credentials
from six.moves import queue
from google.cloud.speech.v1beta1 import cloud_speech_pb2
from google.rpc import code_pb2
from grpc.beta import implementations
from grpc.framework.interfaces.face import face
from google.appengine.api.background_thread.background_thread import BackgroundThread


DEADLINE_SECS = 60 * 3 + 5

def make_channel(host, port):
    """Creates an SSL channel with auth credentials from the environment."""
    # In order to make an https call, use an ssl channel with defaults
    ssl_channel = implementations.ssl_channel_credentials(None, None, None)

    os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "graphe-product-demo-laredoute-1723c2989064.json"
    # Grab application default credentials from the environment
    creds = credentials.get_credentials().create_scoped(['https://www.googleapis.com/auth/cloud-platform'])
    # Add a plugin to inject the creds into the header
    auth_header = (
        'Authorization',
        'Bearer ' + creds.get_access_token().access_token)
    auth_plugin = implementations.metadata_call_credentials(
        lambda _, cb: cb([auth_header], None),
        name='google_creds')

    # compose the two together for both ssl and google auth
    composite_channel = implementations.composite_channel_credentials(
        ssl_channel, auth_plugin)

    return implementations.secure_channel(host, port, composite_channel)

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
        language_code='fr-FRA',  # a BCP-47 language tag
    )
    streaming_config = cloud_speech_pb2.StreamingRecognitionConfig(
        config=recognition_config,
    )

    yield cloud_speech_pb2.StreamingRecognizeRequest(
        streaming_config=streaming_config)

    past_time = time.time()

    for data in data_stream:
        # Limits the stream rate in order to prevent an audio streamed to fast error
        time.sleep(max(0, 0.1 + past_time - time.time()))
        past_time = time.time()
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

    def run(self):
        recognize_audio(self.buff, self.rate, self.callback)