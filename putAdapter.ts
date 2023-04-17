import type { Address, AgentService, PublicSharing, LanguageContext, LanguageLanguageInput} from "@perspect3vism/ad4m";
import type { IPFS } from "ipfs-core-types"
//@ts-ignore
import axiod from "https://deno.land/x/axiod/mod.ts";
import https from "https";
import { PROXY_URL } from ".";

export class CloudflarePutAdapter implements PublicSharing {
  #agent: AgentService;
  #IPFS: IPFS;

  constructor(context: LanguageContext) {
    this.#agent = context.agent;
    this.#IPFS = context.IPFS;
  }

  async createPublic(language: LanguageLanguageInput): Promise<Address> {
    // @ts-ignore
    const hash = UTILS.hash(language.bundle.toString());

    if(hash != language.meta.address)
      throw new Error(`Language Persistence: Can't store language. Address stated in meta differs from actual file\nWanted: ${language.meta.address}\nGot: ${hash}`)

    const agent = this.#agent;
    const expression = agent.createSignedExpression(language.meta);

    //Build the key value object for the meta object
    const key = `meta-${hash}`;
    const metaPostData = {
      key: key,
      // Content of the new object.
      value: JSON.stringify(expression),
    };
    //Save the meta information to the KV store
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false
    });
    try {
      const metaPostResult = await axiod.post(PROXY_URL, metaPostData, { httpsAgent });
      if (metaPostResult.status != 200) {
        console.error("Upload language meta data gets error: ", metaPostResult);
      }

      //Build the key value object for the language bundle
      const languageBundleBucketParams = {
        key: hash,
        // Content of the new object.
        value: language.bundle.toString(),
      };
      //Save the language bundle to the KV store
      const bundlePostResult = await axiod.post(PROXY_URL, languageBundleBucketParams, { httpsAgent });
      if (bundlePostResult.status != 200) {
        console.error("Upload language bundle data gets error: ", metaPostResult);
      }
      return hash as Address;
    } catch (e) {

      if(e.response.status == 400 && e.response.data.includes("Key already exists")) {
        console.log("[Cloudflare-based Language Language]: Tried to replace existing language. Ignoring...")
        return hash as Address;
      }
      console.error("[Cloudflare-based Language Language]: Error storing Language: ", e.response.data);
      throw e
    }
  }
}
