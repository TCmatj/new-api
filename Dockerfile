FROM golang:1.26.1-alpine@sha256:2389ebfa5b7f43eeafbd6be0c3700cc46690ef842ad962f6c5bd6be49ed82039 AS builder2
ENV GO111MODULE=on CGO_ENABLED=0

ARG TARGETOS
ARG TARGETARCH
ENV GOOS=${TARGETOS:-linux} GOARCH=${TARGETARCH:-amd64}
ENV GOEXPERIMENT=greenteagc

WORKDIR /build

ADD go.mod go.sum ./
RUN go mod download

COPY . .
COPY web/dist ./web/dist
RUN go build -ldflags "-s -w -X 'github.com/QuantumNous/new-api/common.Version=$(cat VERSION)'" -o new-api

FROM calciumion/new-api:latest

COPY --from=builder2 /build/new-api /new-api
EXPOSE 3000
WORKDIR /data
ENTRYPOINT ["/new-api"]
