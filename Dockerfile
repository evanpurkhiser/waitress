FROM debian:stable-slim AS builder

RUN apt-get update \
  && apt-get install -y \
  curl \
  make \
  git \
  gnupg \
  libatomic1 \
  ca-certificates \
  --no-install-recommends \
  && rm -rf /var/lib/apt/lists/*

ENV MISE_DATA_DIR=/mise
ENV MISE_CONFIG_DIR=/mise
ENV MISE_CACHE_DIR=/mise/cache
ENV MISE_INSTALL_PATH=/usr/local/bin/mise
ENV PATH=/mise/shims:$PATH

RUN curl https://mise.run | sh

WORKDIR /app
COPY . .

RUN mise trust mise.toml && mise install

RUN make

FROM debian:stable-slim
COPY --from=builder /app/dist/waitress .
COPY --from=builder /app/dockerStart.sh .

EXPOSE 80
ENV DATA_PATH=/data
VOLUME /data

ENTRYPOINT ["./dockerStart.sh"]
