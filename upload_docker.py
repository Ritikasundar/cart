'''import dropbox
import os
from dotenv import load_dotenv
https://cart-d04e6.web.app
# Load environment variables from .env file
load_dotenv()

# Initialize Dropbox client with your access token
ACCESS_TOKEN = os.getenv('DROPBOX_ACCESS_TOKEN')
if not ACCESS_TOKEN:
    raise ValueError('No Dropbox access token found in environment variables')
dbx = dropbox.Dropbox(ACCESS_TOKEN)

def upload_file(local_path, dropbox_path):
  
    with open(local_path, 'rb') as f:
        dbx.files_upload(f.read(), dropbox_path)
    print(f'Uploaded {local_path} to {dropbox_path}')

# Example usage
file_path = 'E:/kiosk-nodejs/public/uploads/chapati.png'
dropbox_path = '/eg/chapati.png'
upload_file(file_path, dropbox_path)'''
