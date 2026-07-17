use serde::{
    Serialize,
    Deserialize,
};

#[derive(
    Debug,
    Clone,
    Serialize,
    Deserialize,
)]
pub enum ErrorCode {
    Unknown,
    InvalidPacket,
    InvalidSession,
    InvalidTransfer,
    InvalidSignature,
    PermissionDenied,
    UnsupportedProtocol,
    Timeout,
    Internal,
}

#[derive(
    Debug,
    Clone,
    Serialize,
    Deserialize,
)]
pub struct ErrorPacket {
    pub code: ErrorCode,
    pub message: String,
}