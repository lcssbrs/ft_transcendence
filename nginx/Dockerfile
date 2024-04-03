FROM nginx:latest

COPY certs/localhost-key.pem /etc/nginx/certs/localhost-key.pem
COPY certs/localhost.pem /etc/nginx/certs/localhost.pem

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 443
