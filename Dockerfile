#FROM golang:1.18-alpine as builder
FROM ubuntu:22.04@sha256:3c61d3759c2639d4b836d32a2d3c83fa0214e36f195a3421018dbaaf79cbe37f as builder
ARG DEBIAN_FRONTEND=noninteractive

#WORKDIR $GOPATH/src/go.k6.io/k6

RUN apt-get update -y; 
RUN apt-get install wget -y

# Install golang
RUN wget https://go.dev/dl/go1.18.2.linux-amd64.tar.gz
RUN rm -rf /usr/local/go && tar -C /usr/local -xzf go1.18.2.linux-amd64.tar.gz; rm go1.18.2.linux-amd64.tar.gz
ENV PATH="/usr/local/go/bin:${PATH}"

# Install xk6
RUN /usr/local/go/bin/go install go.k6.io/xk6/cmd/xk6@latest

## build k6 with faker extension
## install faker
RUN /root/go/bin/xk6 build v0.2.0 --output /root/go/bin/k6 --with github.com/szkiba/xk6-faker


RUN apt-get update &&  \
    apt-get install -y ca-certificates curl && \
    rm -rf /var/lib/apt/lists/*

RUN curl -O https://s3.amazonaws.com/amazoncloudwatch-agent/debian/amd64/latest/amazon-cloudwatch-agent.deb && \
    dpkg -i -E amazon-cloudwatch-agent.deb && \
    rm -rf /tmp/*


FROM alpine:3.15@sha256:19b4bcc4f60e99dd5ebdca0cbce22c503bbcff197549d7e19dab4f22254dc864
RUN apk add --no-cache ca-certificates
COPY --from=builder /root/go/bin/k6 /usr/bin/k6

COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/ca-certificates.crt
COPY --from=builder /opt/aws/amazon-cloudwatch-agent /opt/aws/amazon-cloudwatch-agent
COPY codebuild/amazon-cloudwatch-agent.json /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json
ADD start.sh .
RUN chmod +x start.sh


ENV RUN_IN_CONTAINER=true
ENV AWS_REGION=eu-south-1

ENTRYPOINT [ "/bin/sh", "start.sh" ]