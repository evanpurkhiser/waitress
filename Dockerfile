FROM debian:stable-slim AS builder

RUN apt-get update \
  && apt-get install -y \
  curl \
  make \
  git \
  golang \
  ca-certificates \
  --no-install-recommends

COPY . .

RUN curl -fsSL https://get.pnpm.io/install.sh | bash -
ENV PATH="/root/.local/share/pnpm:$PATH"

RUN PATH=$PATH:$HOME/go/bin make

FROM debian:stable-slim
COPY --from=builder dist/waitress .
COPY --from=builder dockerStart.sh .

EXPOSE 80
ENV DATA_PATH=/data
VOLUME /data

ENTRYPOINT ["./dockerStart.sh"]
