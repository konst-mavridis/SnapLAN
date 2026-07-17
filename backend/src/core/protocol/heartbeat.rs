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
pub struct Ping {
    pub timestamp: u64;
}

#[derive(
    Debug,
    Clone,
    Serialize,
    Deserialize,
)]
pub struct Pong {
    pub timestamp: u64,
}