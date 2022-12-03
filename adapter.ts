import type { Address, Expression, ExpressionAdapter, PublicSharing, LanguageContext } from "@perspect3vism/ad4m";
import { CloudflarePutAdapter } from "./putAdapter";
import axios from "axios";
import { PROXY_URL } from ".";

export default class Adapter implements ExpressionAdapter {
  putAdapter: PublicSharing;

  constructor(context: LanguageContext) {
    this.putAdapter = new CloudflarePutAdapter(context);
  }

  async get(address: Address): Promise<Expression> {
    const metaDataKey = `meta-${address}`;
    
    let presignedUrl;
    try {
      const getPresignedUrl = await axios.get(PROXY_URL+`?key=${metaDataKey}`);
      presignedUrl = getPresignedUrl.data.url;
    } catch (e) {
      console.error("Get meta information failed at getting presigned url", e);
    }

    let metaObject;
    try {
      const getMetaObject = await axios.get(presignedUrl);
      metaObject = getMetaObject.data;
    } catch (e) {
      console.error("Get meta information failed at getting meta information", e);
    }

    return metaObject;
  }
}
