FROM debian:latest

#MAINTAINER febef <febef.dev@gmail.com>

RUN set -x \
  && apt-get update && apt install curl -y \
  && curl -sL https://deb.nodesource.com/setup_14.x | bash - \
 # && apt-get install --no-install-recommends --no-install-suggests -y -qq nginx openssh-server nodejs supervisor git-core \
  && apt-get install --no-install-recommends --no-install-suggests -y -qq nodejs supervisor \
  && apt-get clean && rm -rf /tmp/*

COPY Docker/supervisor.conf /etc/supervisor/conf.d/supervisor.conf
ADD . /opt/jackwui

RUN echo "Setup Configs..." \
  && (cd /opt/jackwui && npm install) \
  && chmod +x /opt/jackwui/bin/jackwui \
  && echo LANG="en_US.UTF-8" > /etc/default/locale

EXPOSE 3000

STOPSIGNAL SIGTERM

CMD ["/usr/bin/supervisord"]
