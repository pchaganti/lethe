---
id: 01JHQQREM04KP00TH74F0X49W8
url: https://martinfowler.com/articles/patterns-of-distributed-systems/
title: Catalog of Patterns of Distributed Systems
---

Distributed systems provide a particular challenge to program. They often require us to have multiple copies of data, which need to keep synchronized. Yet we cannot rely on processing nodes working reliably, and network delays can easily lead to inconsistencies. Despite this, many organizations rely on a range of core distributed software handling data storage, messaging, system management, and compute capability. These systems face common problems which they solve with similar solutions.

In 2020 I began collecting these solutions as patterns, publishing them on this site as I developed them. In 2023 these were published in the book [Patterns of Distributed Systems](/books/patterns-distributed.html). On this site I now have short summaries of each pattern, with deep links to the relevant chapters for the online eBook publication on oreilly.com (marked on this page with [![](/external.svg)).](https://learning.oreilly.com/library/view/patterns-of-distributed/9780138222246)

[![](/books/joshi.jpg)](/books/patterns-distributed.html)

## [Clock-Bound Wait](clock-bound-wait.html)  [![link to chapter on oreilly.com](/external.svg)](https://learning.oreilly.com/library/view/patterns-of-distributed/9780138222246/ch24.xhtml)

Wait to cover the uncertainty in time across cluster nodes before reading and writing values so that values can be correctly ordered across cluster nodes.

## [Consistent Core](consistent-core.html)  [![link to chapter on oreilly.com](/external.svg)](https://learning.oreilly.com/library/view/patterns-of-distributed/9780138222246/ch25.xhtml)

Maintain a smaller cluster providing stronger consistency to allow the large data cluster to coordinate server activities without implementing quorum-based algorithms.

## [Emergent Leader](emergent-leader.html)  [![link to chapter on oreilly.com](/external.svg)](https://learning.oreilly.com/library/view/patterns-of-distributed/9780138222246/ch29.xhtml)

Order cluster nodes based on their age within the cluster to allow nodes to select a leader without running an explicit election.

## [Fixed Partitions](fixed-partitions.html)  [![link to chapter on oreilly.com](/external.svg)](https://learning.oreilly.com/library/view/patterns-of-distributed/9780138222246/ch19.xhtml)

Keep the number of partitions fixed to keep the mapping of data to partition unchanged when the size of a cluster changes.

## [Follower Reads](follower-reads.html)  [![link to chapter on oreilly.com](/external.svg)](https://learning.oreilly.com/library/view/patterns-of-distributed/9780138222246/ch16.xhtml)

Serve read requests from followers to achieve better throughput and lower latency

## [Generation Clock](generation-clock.html)  [![link to chapter on oreilly.com](/external.svg)](https://learning.oreilly.com/library/view/patterns-of-distributed/9780138222246/ch09.xhtml)

A monotonically increasing number indicating the generation of the server.

## [Gossip Dissemination](gossip-dissemination.html)  [![link to chapter on oreilly.com](/external.svg)](https://learning.oreilly.com/library/view/patterns-of-distributed/9780138222246/ch28.xhtml)

Use a random selection of nodes to pass on information to ensure it reaches all the nodes in the cluster without flooding the network

## [HeartBeat](heartbeat.html)  [![link to chapter on oreilly.com](/external.svg)](https://learning.oreilly.com/library/view/patterns-of-distributed/9780138222246/ch07.xhtml)

Show a server is available by periodically sending a message to all the other servers.

## [High-Water Mark](high-watermark.html)  [![link to chapter on oreilly.com](/external.svg)](https://learning.oreilly.com/library/view/patterns-of-distributed/9780138222246/ch10.xhtml)

An index in the write-ahead log showing the last successful replication.

## [Hybrid Clock](hybrid-clock.html)  [![link to chapter on oreilly.com](/external.svg)](https://learning.oreilly.com/library/view/patterns-of-distributed/9780138222246/ch23.xhtml)

Use a combination of system timestamp and logical timestamp to have versions as date and time, which can be ordered

## [Idempotent Receiver](idempotent-receiver.html)  [![link to chapter on oreilly.com](/external.svg)](https://learning.oreilly.com/library/view/patterns-of-distributed/9780138222246/ch15.xhtml)

Identify requests from clients uniquely so you can ignore duplicate requests when client retries

## [Lamport Clock](lamport-clock.html)  [![link to chapter on oreilly.com](/external.svg)](https://learning.oreilly.com/library/view/patterns-of-distributed/9780138222246/ch22.xhtml)

Use logical timestamps as a version for a value to allow ordering of values across servers

## [Lease](lease.html)  [![link to chapter on oreilly.com](/external.svg)](https://learning.oreilly.com/library/view/patterns-of-distributed/9780138222246/ch26.xhtml)

Use time-bound leases for cluster nodes to coordinate their activities.

## [Low-Water Mark](low-watermark.html)  [![link to chapter on oreilly.com](/external.svg)](https://learning.oreilly.com/library/view/patterns-of-distributed/9780138222246/ch05.xhtml)

An index in the write-ahead log showing which portion of the log can be discarded.

## [Majority Quorum](majority-quorum.html)  [![link to chapter on oreilly.com](/external.svg)](https://learning.oreilly.com/library/view/patterns-of-distributed/9780138222246/ch08.xhtml)

Avoid two groups of servers making independent decisions by requiring majority for taking every decision.

## [Paxos](paxos.html)  [![link to chapter on oreilly.com](/external.svg)](https://learning.oreilly.com/library/view/patterns-of-distributed/9780138222246/ch11.xhtml)

Use two consensus building phases to reach safe consensus even when nodes disconnect

## [Replicated Log](replicated-log.html)  [![link to chapter on oreilly.com](/external.svg)](https://learning.oreilly.com/library/view/patterns-of-distributed/9780138222246/ch12.xhtml)

Keep the state of multiple nodes synchronized by using a write-ahead log that is replicated to all the cluster nodes.

## [Request Batch](request-batch.html)  [![link to chapter on oreilly.com](/external.svg)](https://learning.oreilly.com/library/view/patterns-of-distributed/9780138222246/ch31.xhtml)

Combine multiple requests to optimally utilise the network

## [Request Pipeline](request-pipeline.html)  [![link to chapter on oreilly.com](/external.svg)](https://learning.oreilly.com/library/view/patterns-of-distributed/9780138222246/ch32.xhtml)

Improve latency by sending multiple requests on the connection without waiting for the response of the previous requests.

## [Request Waiting List](request-waiting-list.html)  [![link to chapter on oreilly.com](/external.svg)](https://learning.oreilly.com/library/view/patterns-of-distributed/9780138222246/ch14.xhtml)

Track client requests which require responses after the criteria to respond is met based on responses from other cluster nodes.

## [Segmented Log](segmented-log.html)  [![link to chapter on oreilly.com](/external.svg)](https://learning.oreilly.com/library/view/patterns-of-distributed/9780138222246/ch04.xhtml)

Split log into multiple smaller files instead of a single large file for easier operations.

## [Single-Socket Channel](single-socket-channel.html)  [![link to chapter on oreilly.com](/external.svg)](https://learning.oreilly.com/library/view/patterns-of-distributed/9780138222246/ch30.xhtml)

Maintain the order of the requests sent to a server by using a single TCP connection

## [Singular Update Queue](singular-update-queue.html)  [![link to chapter on oreilly.com](/external.svg)](https://learning.oreilly.com/library/view/patterns-of-distributed/9780138222246/ch13.xhtml)

Use a single thread to process requests asynchronously to maintain order without blocking the caller.

## [State Watch](state-watch.html)  [![link to chapter on oreilly.com](/external.svg)](https://learning.oreilly.com/library/view/patterns-of-distributed/9780138222246/ch27.xhtml)

Notify clients when specific values change on the server

## [Version Vector](version-vector.html)  [![link to chapter on oreilly.com](/external.svg)](https://learning.oreilly.com/library/view/patterns-of-distributed/9780138222246/ch18.xhtml)

Maintain a list of counters, one per cluster node, to detect concurrent updates

## [Versioned Value](versioned-value.html)  [![link to chapter on oreilly.com](/external.svg)](https://learning.oreilly.com/library/view/patterns-of-distributed/9780138222246/ch17.xhtml)

Store every update to a value with a new version, to allow reading historical values.

## [Write-Ahead Log](write-ahead-log.html)  [![link to chapter on oreilly.com](/external.svg)](https://learning.oreilly.com/library/view/patterns-of-distributed/9780138222246/ch03.xhtml)

Provide durability guarantee without the storage data structures to be flushed to disk, by persisting every state change as a command to the append only log.
