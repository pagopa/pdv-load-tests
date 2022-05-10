FROM golang:1.18-alpine

RUN go install go.k6.io/k6@v0.37.0

# install xk6
RUN go install go.k6.io/xk6/cmd/xk6@latest

# build the image 
# RUN xk6 build --output /usr/bin/k6 --with github.com/szkiba/xk6-faker@latest

# ENTRYPOINT ["k6", "run"]