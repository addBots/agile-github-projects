FROM nginx:1.15.2-alpine

# Add bash
RUN apk add --no-cache bash

# Clear nginx html dir
RUN rm -r /usr/share/nginx/html/*

# Copy all assets from all dashboards
RUN mkdir assets
COPY . /assets
COPY ./scripts/run_container.sh /assets/scripts/run_container.sh
WORKDIR /assets

RUN chmod +x scripts/run_container.sh

RUN cp config_nginx/compression.conf /etc/nginx/conf.d/
RUN cp config_nginx/default.conf /etc/nginx/conf.d/

RUN cd scripts && ls

EXPOSE 80

ENTRYPOINT ["/bin/sh", "-c", "./scripts/run_container.sh \"$@\"", "--"]