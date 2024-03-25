FROM nginx:latest

COPY certs/ma_clé_privée.key /etc/nginx/certs/ma_clé_privée.key
COPY certs/mon_certificat.crt /etc/nginx/certs/mon_certificat.crt

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 443
