FROM debian:stable-slim as builder

RUN apt-get update \
  && apt-get install -y \
  curl \
  make \
  git \
  golang \
  ca-certificates \
  --no-install-recommends

COPY . .

SHELL ["/bin/bash", "-c"]

ENV VOLTA_HOME=/root/.volta
ENV PATH=$VOLTA_HOME/bin:$PATH
RUN curl https://get.volta.sh | bash

RUN PATH=$PATH:$HOME/go/bin make

FROM debian:stable-slim
COPY --from=builder dist/waitress .
COPY --from=builder dockerStart.sh .

EXPOSE 80
ENV DATA_PATH=/data
VOLUME /data

ENTRYPOINT ["./dockerStart.sh"]
