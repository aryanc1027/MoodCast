import http.server
import ssl

class NoCacheHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
context.load_cert_chain(certfile='./localhost.pem', keyfile='./localhost-key.pem')

httpd = http.server.HTTPServer(('localhost', 8000), NoCacheHTTPRequestHandler)

httpd.socket = context.wrap_socket(httpd.socket, server_side=True)


print("Serving HTTPS on https://localhost:8000")
httpd.serve_forever()