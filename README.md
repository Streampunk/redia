# redia
Testing media performance of a [redis](https://redis.io/) [cluster](https://redis.io/topics/cluster-tutorial). This project contains a a script that writes and then reads back blobs of data that simulate video payloads of various kinds. Performance is measured by timing the operations, both executing in series and in parallel. The purpose of the tests is to determine - at the most basic level - whether the binary data blob support in redis is suitable for video payloads.

The target cluster of these tests is the [AWS Elasticache for Redis](https://aws.amazon.com/elasticache/redis/) with shards and replicas. Access to the cluster requires a client implementation with cluster support, with the [ioredis](https://github.com/luin/ioredis) library's [cluster support](https://github.com/luin/ioredis#cluster) selected.  

## Set up and run tests

### Set up a redis cluster

![redis replication diagram][redis_replication.png]

A redis cluster can be set up using the AWS Elasticache dashboard as described [here](https://docs.aws.amazon.com/AmazonElastiCache/latest/red-ug/GettingStarted.html). Choose a network speed appropriate for the tests, for example _Up to 10 Gigabit_ is required for testing simulated HD media.

Alternatively, set up a cache locally by following the [instructions](https://redis.io/topics/cluster-tutorial#creating-and-using-a-redis-cluster).

Take note of the endpoint address to access the cluster and whether the default port is `6379`. Check access to the cluster using the redis CLI.

### Set up the redia client

Run up an Amazon EC2 instance in the same AWS VPC as the cluster or use a computer with local network access to the redis cluster. To install:

1. Install [Node.JS](https://nodejs.org/en/) LTS version, which includes the Node Package Manager command `npm`.
2. Clone this project using git:

    git clone https://github.com/Streampunk/redia.git

3. Enter the redia folder with `cd redia` and run `npm install`.

Edit the `index.js` file to change the kinds of tests that are to be run or the number of frames to be used for each test.

### Run the redia client

For an endpoint port of `6379` and endpoint `endpoint1.cluster.redis_test.acme.com`, run:

    node index.js 6379 endpoint1.cluster.redis_test.acme.com

This will run the tests and for each set, produce a result that looks like ....

```
Roundtripped 1080i50 V210 simulated 100 frames write time 0.022748896520000002 read time 0.01130522825.
Roundtripped 1080i50 V210 parallel simulated 100 frames write time 0.01310201511 read time 0.00971127429.
...
```

Timing measurements are in seconds.

## Status, support and further development

Contributions can be made via pull requests and will be considered by the author on their merits. Enhancement requests and bug reports should be raised as github issues. For support, please contact [Streampunk Media](http://www.streampunk.media/).

## License

This software is released under the Apache 2.0 license. Copyright 2018 Streampunk Media Ltd.
