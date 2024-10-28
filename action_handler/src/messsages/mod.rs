use serde::{Serialize, Deserialize};

pub mod info;


// Info
#[derive(Serialize, Deserialize, Debug)]
pub struct BaseMessage {
    pub message_id: String,
    pub timestamp: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct InfoMessage {
    #[serde(flatten)]
    pub base: BaseMessage,
    pub message: String,
}

// Errors
#[derive(Serialize, Deserialize, Debug)]
pub struct ErrorMessage {
    #[serde(flatten)]
    pub base: BaseMessage,
    pub details: ErrorDetails,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ErrorDetails {
    pub reason: String,
    pub suggestions: Vec<String>,
}
