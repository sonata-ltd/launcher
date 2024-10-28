use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct BaseMessage {
    pub message_id: String,
    pub timestamp: String,
}
