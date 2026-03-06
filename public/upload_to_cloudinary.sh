#!/bin/sh

# pipx install cloudinary-cli
# export CLOUDINARY_URL="cloudinary://api_key:api_secret@cloud_name"

# Cambiamos "products" por "cars"
cld upload_dir cars -o overwrite true -o use_filename true -o unique_filename false