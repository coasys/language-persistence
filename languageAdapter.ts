import type { Address, LanguageAdapter, PublicSharing, LanguageContext } from "@perspect3vism/ad4m";
import axios from "axios";
import { PROXY_URL } from ".";
import XMLHttpRequest from 'xhr2';

export default class LangAdapter implements LanguageAdapter {
  putAdapter: PublicSharing;

  constructor(context: LanguageContext) {
  }

  async getLanguageSource(address: Address): Promise<string> {
    const cid = address.toString();

    let presignedUrl;
    try {
      const getPresignedUrl = await axios.get(PROXY_URL+`?key=${cid}`);
      presignedUrl = getPresignedUrl.data.url;
      console.log("Get language source information got presigned url", presignedUrl);
    } catch (e) {
      console.error("Get language source failed at getting presigned url", e);
    }

    let languageSource;
    try {
      const getLanguageSource = await axios.get(presignedUrl);
      languageSource = getLanguageSource.data;
      console.log("Got some language source data");
    } catch (e) {
      console.error("Get language source failed at getting language source", e);
    }

    return languageSource;
  }
}
