use hdk::prelude::*;
use chrono::{DateTime, Utc};

#[derive(Clone, Serialize, Deserialize, SerializedBytes, Debug)]
pub struct ExpressionProof {
    pub signature: String,
    pub key: String
}

#[derive(Clone, Serialize, Deserialize, SerializedBytes, Debug)]
#[serde(rename_all = "camelCase")]
pub struct LanguageMetaInternal {
    pub name: String,
    pub address: String,
    pub description: String,
    pub template_source_language_address: Option<String>,
    pub template_applied_params: Option<String>,
    pub possible_template_params: Option<Vec<String>>,
    pub source_code_link: Option<String>,
}
#[hdk_entry(id = "expression", visibility = "public")]
#[derive(Clone)]
pub struct Expression {
    pub author: String,
    pub timestamp: DateTime<Utc>,
    pub data: LanguageMetaInternal,
    pub proof: ExpressionProof
}

entry_defs![
    PathEntry::entry_def(),
    Expression::entry_def()
];

#[derive(Serialize, Deserialize, SerializedBytes, Debug)]
pub struct StoreInput {
    pub key: String,
    pub expression: Expression
}

#[hdk_extern]
pub fn store_expression(input: StoreInput) -> ExternResult<()> {
    debug!("Store: {:#?}", input);
    let path = Path::from(input.key);
    path.ensure()?;

    create_entry(&input.expression)?;
    let expression_hash = hash_entry(&input.expression)?;
    create_link(path.path_entry_hash()?, expression_hash, ())?;
    
    Ok(())
}

#[derive(Serialize, Deserialize, SerializedBytes, Debug)]
pub struct GetInput {
    pub key: String,
}

#[derive(Serialize, Deserialize, SerializedBytes, Debug)]
pub struct GetOutput {
    pub expressions: Vec<Expression>
}

#[hdk_extern]
pub fn get_expressions(input: GetInput) -> ExternResult<GetOutput> {
    let path = Path::from(input.key);
    let expressions = get_links_and_load_type::<Expression>(path.path_entry_hash()?, None)?;
    Ok(GetOutput{ expressions })
}

pub fn get_links_and_load_type<R: TryFrom<Entry>>(
    base: EntryHash,
    tag: Option<LinkTag>,
) -> ExternResult<Vec<R>> {
    let links = get_links(base.into(), tag)?;

    Ok(links
       .iter()
       .map(
           |link|  {
               if let Some(element) = get(link.target.clone(), GetOptions::content()).map_err(|_| "Get error")? {
                   let e: Entry = element.entry().clone().into_option().ok_or("Hash not found")?;
                   let entry: R = R::try_from(e).map_err(|_e| "Hash not found")?;
                   return Ok(entry);
               };
               Err("Hash not found")
           },
       )
       .filter_map(Result::ok)
       .collect())
}