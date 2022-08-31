import http.server
import socketserver
import webbrowser
import os
from threading import Thread

class MyRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        rootdir = os.path.join(os.path.dirname(os.path.realpath(__file__)), 'interface/') #file location  
        os.chdir(rootdir)
        print(self.path, 'serving...')
        return http.server.SimpleHTTPRequestHandler.do_GET(self)


def window(PORT):
    #open a public URL, in this case, the webbrowser docs
    url = "http://localhost:" + str(PORT)
    webbrowser.get(using='google-chrome').open(url)


def render():
    PORT = 9900
    Handler = MyRequestHandler

    browser = Thread(target=window, args=(PORT,))
    browser.setDaemon(True)
    browser.start()

    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print("serving at port", PORT)
        httpd.serve_forever()

