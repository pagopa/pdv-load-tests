#FROM golang:1.18-alpine as builder
FROM ubuntu:22.04 as builder
ARG DEBIAN_FRONTEND=noninteractive

#WORKDIR $GOPATH/src/go.k6.io/k6

RUN apt-get update -y; 
RUN apt-get install git -y; apt-get install golang -y; apt-get install gnupg2 -y

# Install k6
RUN mkdir /root/.gnupg/
RUN gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
RUN echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | tee /etc/apt/sources.list.d/k6.list
RUN apt-get update -y
# RUN apt-get install k6 -y
RUN go install go.k6.io/k6@v0.37.0
  
# install xk6
RUN CGO_ENABLED=0 
RUN go install go.k6.io/xk6/cmd/xk6@v0.6.1

# build the image 
RUN /root/go/bin/xk6 build --output /root/go/bin/k6 --with github.com/szkiba/xk6-faker@v0.2.0

FROM alpine:3.15
RUN apk add --no-cache ca-certificates && \
    adduser -D -u 12345 -g 12345 k6
COPY --from=builder /go/bin/k6 /usr/bin/k6

USER 12345
WORKDIR /home/k6
ENTRYPOINT ["k6"]