# ssb-file-sharing

A file sharing app written with Secure Scuttlebutt and Dat.

## Motivation

I discovered Secure Scuttlebutt and Dat around april 2017 and since then I can't really imagine building applications in an other way than decentralized. Although I did search actively quite often about subjects like [offline first](), [no backend]() or [realtime collaboration](), I did not find something as powerful as SSB or Dat. I really love the true peer-to-peer approach, and the way SSB implements social via crypto identities and append-only personal logs.

After using Patchwork to discover the Secure Scuttlebutt social network, and messing around with Dat to share files, I needed a pretext to start writing an application. I chose to experiment writing a file sharing application, because I feel it's the main need for my company and myself.

## Ideas

Files would be shared and synchronized by Dat.
On startup the application would seed the shared files of the user starting a Dat client.
I noticed that Dat handles directories, not files. Perhaps using hyperdrive directly, or Webtorrent or IPFS.

Sharing a directory would publish a message in the Scuttlebutt log of the user, like:

```json
{
  "type": "share-dat",
  "dirPath": "/home/cbenz/Pictures/2017-12-24 Christmas",
  "datKey": "0d0148c9f3c7907bf7c1f2bfba42f9b18b8f63771c9f72877bd3a276fee1f297"
}
```

When subscribing to a friend's Scuttlebutt log, the user would know what files the friend is sharing, and should be able to trigger the synchronization of the corresponding Dat archive. Dat's sparse mode could be used to discover the contents of a Dat archive without fully downloading it.
The user would tell where to store the downloaded files, and the application would store this information by publishing another message in its Scuttlebutt log.
