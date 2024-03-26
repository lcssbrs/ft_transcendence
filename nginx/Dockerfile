FROM nginx:latest

COPY certs/ma_clé_privée.key /etc/nginx/certs/ma_clé_privée.key
COPY certs/mon_certificat.cer /etc/nginx/certs/mon_certificat.cer

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 443
