use serde::{
    Deserialize,
    Serialize,
};
use super::{
    DeviceId,
    SessionId,
};

#[derive(
    Debug,
    Clone,
    Serialize,
    Deserialize,
)]
pub enum SessionState {
    Handshaking,
    Active,
    Closing,
    Closed,
}

#[derive(
    Debug,
    Clone,
    Serialize,
    Deserialize,
)]
pub struct SessionCreate {
    pub session_id: SessionId,
    pub peer: DeviceId,
}

#[derive(
    Debug,
    Clone,
    Serialize,
    Deserialize,
)]
pub struct SessionReady {
    pub session_id: SessionId,
}

#[derive(
    Debug,
    Clone,
    Serialize,
    Deserialize,
)]
pub struct SessionClose {
    pub session_id: SessionId,
}