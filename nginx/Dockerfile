FROM nginx:latest

COPY certs/ma_cle_privee.key /etc/nginx/certs/ma_cle_privee.key
COPY certs/mon_certificat.cer /etc/nginx/certs/mon_certificat.cer

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 443
