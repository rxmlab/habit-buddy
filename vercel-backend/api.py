from http.server import BaseHTTPRequestHandler
import json

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/health':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
            self.end_headers()
            response = {"status": "healthy", "service": "habitbuddy-api", "mode": "vercel"}
            self.wfile.write(json.dumps(response).encode())
        elif self.path == '/':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
            self.end_headers()
            response = {"message": "HabitBuddy API", "version": "1.0.0", "deployment": "vercel"}
            self.wfile.write(json.dumps(response).encode())
        elif self.path == '/api/test':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
            self.end_headers()
            response = {"message": "API is working!", "timestamp": "2024-01-01T00:00:00Z"}
            self.wfile.write(json.dumps(response).encode())
        elif self.path == '/api/habits':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
            self.end_headers()
            habits = [
                {
                    "id": "1",
                    "title": "Morning Jog",
                    "days_target": 21,
                    "color": "#ff6b6b",
                    "created_at": "2024-01-01T00:00:00Z",
                    "check_ins": {"2024-01-01": "hash_2024-01-01"},
                    "reminder": None,
                    "badge": None
                },
                {
                    "id": "2", 
                    "title": "Read 10 Pages",
                    "days_target": 40,
                    "color": "#ffd166",
                    "created_at": "2024-01-05T00:00:00Z",
                    "check_ins": {},
                    "reminder": None,
                    "badge": None
                }
            ]
            self.wfile.write(json.dumps(habits).encode())
        else:
            self.send_response(404)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            response = {"error": "Not found", "path": self.path}
            self.wfile.write(json.dumps(response).encode())

    def do_POST(self):
        if self.path == '/api/habits':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
            self.end_headers()
            response = {
                "id": "3",
                "title": "New Habit",
                "days_target": 30,
                "color": "#3b82f6",
                "created_at": "2024-01-01T00:00:00Z",
                "check_ins": {},
                "reminder": None,
                "badge": None
            }
            self.wfile.write(json.dumps(response).encode())
        else:
            self.send_response(404)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            response = {"error": "Not found", "path": self.path}
            self.wfile.write(json.dumps(response).encode())

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()
