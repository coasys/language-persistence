import fetch from "node-fetch";
import axios from "axios";
import type { Readable } from "stream";
import { AwsClient } from "aws4fetch";

const cid = "QmZ16K5HG2RgE6Q8xCC5784HG2KGyKPKtkNmGiDb9YQKZg";
const PROXY_URL = "https://bootstrap-store-gateway.perspect3vism.workers.dev";

async function run() {
  let presignedUrl;
  console.log("heehe");
  try {
    const response = await axios.get(PROXY_URL + `?key=${cid}`);
    presignedUrl = response.data.url;
    console.log("presigned url:", presignedUrl);
  } catch (e) {
    console.error("Get language source failed at getting presigned url", cid);
    console.log("Error throws:", e);
    throw e;
  }

  let languageSource;
  try {
    // const res = await fetch(presignedUrl, {
    //   method: "GET",
    //   Headers: {
    //     "Application-Type": "plain/text"
    //   }
    // });
    // languageSource = await res.text();

    const response = await axios({
      method: "get",
      url: presignedUrl,
      headers: {
        "Accept": "text/plain"
      }
    });
    languageSource = response.data;
    console.log("source");
  } catch (e) {
    console.error("Get language source failed at getting language source", cid);
    console.log("Error throws:", e);
    throw e;
  }
}

async function streamToString(stream: Readable): Promise<string> {
  return await new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
  });
}

run();
