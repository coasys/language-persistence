import { Orchestrator, Config, InstallAgentsHapps, TransportConfigType } from "@holochain/tryorama";
import path from "path";

const network = {
  transport_pool: [{
    type: TransportConfigType.Quic,
  }],
  bootstrap_service: "https://bootstrap.holo.host"
}
const conductorConfig = Config.gen();
const languages = path.join(__dirname, "../../workdir/languages.dna");
const installation: InstallAgentsHapps = [
  // agent 0
  [
    // happ 0
    [languages],
  ],
];

const ZOME = "anchored-expression"

const orchestrator = new Orchestrator();

orchestrator.registerScenario("create a code", async (s, t) => {
  const [alice] = await s.players([conductorConfig]);
  const [[anchored_expression]] = await alice.installAgentsHapps(installation);
  
  const proof = {
    signature: "asdfasdfasdf",
    key: "did:test:test#primary"
  }

  const expression = {
    author: "did:test:test",
    timestamp: new Date().toISOString(),
    data: {
      name: "test",
      address: "address",
      description: "description",
      templateSourceLanguageAddress: null,
      templateAppliedParams: null,
      possibleTemplateParams: null,
      sourceCodeLink: null,
    },
    proof
  }

  await anchored_expression.cells[0].call(
    ZOME,
    "store_expression",
    {
        key: "test-key",
        expression
    }
  );
  

  const result = await anchored_expression.cells[0].call(
    ZOME,
    "get_expressions",
    {
      key: "test-key"
    }
  )

  t.ok(result)
  t.ok(result.expressions)
  t.equal(result.expressions.length, 1)
  t.deepEqual(result.expressions[0], expression)
});

orchestrator.run();
