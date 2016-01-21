from wsgiref.simple_server import make_server
from webob import static

httpd = make_server('', 8001, static.DirectoryApp('.'))
print("Serving on port 8000...")
# Serve until process is killed
httpd.serve_forever()
