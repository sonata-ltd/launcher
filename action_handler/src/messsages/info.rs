use serde::{Deserialize, Serialize};

use super::BaseMessage;


#[derive(Serialize, Deserialize, Debug)]
pub struct InfoMessage {
    #[serde(flatten)]
    pub base: BaseMessage,
}
