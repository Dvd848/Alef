"""
Python wrapper for Reverso Cognitive Services Text-to-speech translator
copied from https://github.com/rt400/pyttsreverso
"""
import base64
import requests

ReversoApiUrl = "https://voice.reverso.net/RestPronunciation.svc/v1/output=json/GetVoiceStream/voiceName={}" \
                    "?&inputText={}&voiceSpeed={}&mp3BitRate={}"

headers = {
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) '
                  'Chrome/75.0.3770.142 Safari/537.36'
    }

VoiceName = {'Leila-Arabic': 'Leila22k', 'Mehdi-Arabic': 'Mehdi22k', 'Nizar-Arabic': 'Nizar22k',
             'Salma-Arabic': 'Salma22k', 'Lisa-Australian-English': 'Lisa22k',
             'Tyler-Australian-English': 'Tyler22k', 'Jeroen-Belgian-Dutch': 'Jeroen22k',
             'Sofie-Belgian-Dutch': 'Sofie22k', 'Zoe-Belgian-Dutch': 'Zoe22k',
             'Alice-BE-Belgian-French': 'Alice-BE22k', 'Anais-BE-Belgian-French': 'Anais-BE22k',
             'Antoine-BE-Belgian-French': 'Antoine-BE22k', 'Bruno-BE-Belgian-French': 'Bruno-BE22k',
             'Claire-BE-Belgian-French': 'Claire-BE22k', 'Julie-BE-Belgian-French': 'Julie-BE22k',
             'Justine-Belgian-French': 'Justine22k', 'Manon-BE-Belgian-French': 'Manon-BE22k',
             'Margaux-BE-Belgian-French': 'Margaux-BE22k', 'Marcia-Brazilian': 'Marcia22k',
             'Graham-British': 'Graham22k', 'Lucy-British': 'Lucy22k', 'Peter-British': 'Peter22k',
             'QueenElizabeth-British': 'QueenElizabeth22k', 'Rachel-British': 'Rachel22k',
             'Louise-Canadian-French': 'Louise22k', 'Laia-Catalan': 'Laia22k', 'Eliska-Czech': 'Eliska22k',
             'Mette-Danish': 'Mette22k', 'Rasmus-Danish': 'Rasmus22k', 'Daan-Dutch': 'Daan22k',
             'Femke-Dutch': 'Femke22k', 'Jasmijn-Dutch': 'Jasmijn22k', 'Max-Dutch': 'Max22k',
             'Samuel-Finland-Swedish': 'Samuel22k', 'Sanna-Finnish': 'Sanna22k', 'Alice-French': 'Alice22k',
             'Anais-French': 'Anais22k', 'Antoine-French': 'Antoine22k', 'Bruno-French': 'Bruno22k',
             'Claire-French': 'Claire22k', 'Julie-French': 'Julie22k', 'Manon-French': 'Manon22k',
             'Margaux-French': 'Margaux22k', 'Andreas-German': 'Andreas22k', 'Claudia-German': 'Claudia22k',
             'Julia-German': 'Julia22k', 'Klaus-German': 'Klaus22k', 'Sarah-German': 'Sarah22k',
             'Kal-Gothenburg-Swedish': 'Kal22k', 'Dimitris-Greek': 'Dimitris22k',
             'he-IL-Asaf-Hebrew': 'he-IL-Asaf', 'Deepa-Indian-English': 'Deepa22k', 'Chiara-Italian': 'Chiara22k',
             'Fabiana-Italian': 'Fabiana22k', 'Vittorio-Italian': 'Vittorio22k', 'Sakura-Japanese': 'Sakura22k',
             'Minji-Korean': 'Minji22k', 'Lulu-Mandarin-Chinese': 'Lulu22k', 'Bente-Norwegian': 'Bente22k',
             'Kari-Norwegian': 'Kari22k', 'Olav-Norwegian': 'Olav22k', 'Ania-Polish': 'Ania22k',
             'Monika-Polish': 'Monika22k', 'Celia-Portuguese': 'Celia22k',
             'ro-RO-Andrei-Romanian': 'ro-RO-Andrei',
             'Alyona-Russian': 'Alyona22k', 'Mia-Scanian': 'Mia22k', 'Antonio-Spanish': 'Antonio22k',
             'Ines-Spanish': 'Ines22k', 'Maria-Spanish': 'Maria22k', 'Elin-Swedish': 'Elin22k',
             'Emil-Swedish': 'Emil22k', 'Emma-Swedish': 'Emma22k', 'Erik-Swedish': 'Erik22k',
             'Ipek-Turkish': 'Ipek22k', 'Heather-US-English': 'Heather22k', 'Karen-US-English': 'Karen22k',
             'Kenny-US-English': 'Kenny22k', 'Laura-US-English': 'Laura22k', 'Micah-US-English': 'Micah22k',
             'Nelly-US-English': 'Nelly22k', 'Rod-US-English': 'Rod22k', 'Ryan-US-English': 'Ryan22k',
             'Saul-US-English': 'Saul22k', 'Sharon-US-English': 'Sharon22k', 'Tracy-US-English': 'Tracy22k',
             'Will-US-English': 'Will22k', 'Rodrigo-US-Spanish': 'Rodrigo22k', 'Rosa-US-Spanish': 'Rosa22k'}

class TooManyRequestsError(Exception):
    def __init__(self, message="Too many requests, please try again later"):
        self.message = message
        super().__init__(self.message)

class ReversoTTS(object):
    """
    Interface class for the Reverso Cognitive Services Text-to-speech translator
    """

    def __init__(self):
        self._voice = None

    def get_voice(self, voice):
        if voice:
            return VoiceName[voice]
        return "Sharon22k"

    def text_to_bash64(self, message):
        message_bytes = message.encode('utf-8')
        base64_bytes = base64.b64encode(message_bytes)
        return base64_bytes.decode('utf-8')

    def convert_text(self, voice="Sharon-US-English", pitch="100", bitrate="128k", msg="There is no text to convert"):
        self._voice = self.get_voice(voice)
        url = ReversoApiUrl.format(self._voice, self.text_to_bash64(msg), pitch, bitrate)
        req = requests.get(url, headers=headers)
        if req.status_code == 200:
            return req.content
        raise TooManyRequestsError()