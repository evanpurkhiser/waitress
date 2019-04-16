FROM alpine:3.9 as builder

RUN apk add musl-dev make git go yarn
COPY . .
RUN PATH=$PATH:$HOME/go/bin make

FROM alpine:3.9
COPY --from=builder dist/waitress .

EXPOSE 80
ENV DATA_PATH /data
VOLUME /data

CMD ["sh", "-c", "exec ./waitress -root $DATA_PATH -port 80"]
