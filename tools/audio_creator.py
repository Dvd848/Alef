import os
import time

from typing import List
from google.cloud import texttospeech
from pyttsreverso import ReversoTTS

# todo add dagesh
hebrewLetters = {
    # 'א':"alef",
    # 'ב':"bet",
    # 'ג':"gimel",
    # 'ד':"daled",
    # 'ה':"hey",
    # 'ו':"vav",
    'ז':"zain",
    'ח':"chet",
    'ט':"tet",
    'י':"yod",
    'כ':"kaf",
    'ל':"lamed",
    'מ':"mem",
    'נ':"nun",
    'ס':"samech",
    'ע':"ain",
    'פ':"pe",
    'צ':"tzadik",
    'ק':"kuf",
    'ר':"resh",
    'ש':"shin",
    'ש'+'\u05C2':"sin",
    'ת':"taf",
}

niqqudCharacters = {
    '\u05B0':"shva",
    '\u05B1':"segol_katan",
    '\u05B2':"hataf_patach",
    '\u05B3':"hataf_kamatz",
    '\u05B4':"hirik",
    '\u05B5':"tzere",
    '\u05B6':"segol",
    '\u05B7':"patach",
    '\u05B8':"kamatz",
    '\u05B9':"holam",
    '\u05BB':"kubutz",
}
shin = {
    '\u05C2',"shin"
}

# you need to add your credentials or use reverso free API
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = os.path.abspath('creds.json')

def speak_google(texts: List[str], destinations: List[str], target_language: str='he'):
    # Step 1: Translate the text
    client = texttospeech.TextToSpeechClient()
    input = texttospeech.SynthesisInput()
    voice = texttospeech.VoiceSelectionParams()
    voice.language_code = target_language
    audio_config = texttospeech.AudioConfig()
    audio_config.audio_encoding = "OGG_OPUS"

    # Step 2: Synthesize the translated text to audio
    for text, destination in zip(texts, destinations):
        input.text = text
        request = texttospeech.SynthesizeSpeechRequest(
                    input=input,
                    voice=voice,
                    audio_config=audio_config,
                )
        response = client.synthesize_speech(request=request)
        output_file = f'{destination}.opus'  # You can change the file format if needed
        with open(output_file, 'wb') as out:
            out.write(response.audio_content)

def speak_reverso(texts: List[str], destinations: List[str], target_language: str='he'):
    lang = 'he-IL-Asaf-Hebrew' if target_language == 'he' else 'Tyler-Australian-English'
    reverso = ReversoTTS()
    for text, destination in zip(texts, destinations):
        output_file = f'{destination}.mp3'  # You can change the file format if needed
        if os.path.exists(destination):
            continue
        data = reverso.convert_text(voice=lang, bitrate=128, msg=text, pitch=75)
        with open(output_file, 'wb') as out:
            out.write(data)

def run():
    inputs = []
    dests = []
    audio_dir = os.path.join(os.pardir, "audio")
    for letter, l_name in hebrewLetters.items():
        dest = os.path.join(audio_dir, l_name)
        inputs.append(letter)
        dests.append(dest)
        for nikud, n_name in niqqudCharacters.items():
            text_to_translate = f'{letter}{nikud}'
            dest = os.path.join(audio_dir, f"{l_name}_{n_name}")
            inputs.append(text_to_translate)
            dests.append(dest)
    os.makedirs(audio_dir, exist_ok=True)
    while True:
        try:
            speak_reverso(inputs, dests)
            break
        except:
            print("sleeping...")
            time.sleep(300) # handle quota exception

if __name__ == '__main__':
    run()