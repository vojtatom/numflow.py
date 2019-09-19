import http.server
import socketserver
import os

class MyRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/':
            self.path = os.path.join(os.path.dirname(os.path.realpath(__file__)), 'interface/index.html')
        print(self.path, 'serving...')
        return http.server.SimpleHTTPRequestHandler.do_GET(self)


def render():
    PORT = 8000
    Handler = MyRequestHandler


    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print("serving at port", PORT)
        httpd.serve_forever()