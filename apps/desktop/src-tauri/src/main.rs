#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use discord_rpc_client::Client;
use std::sync::{Arc, Mutex};
use tauri::{Manager, State};

struct DiscordState(Arc<Mutex<Option<Client>>>);

#[tauri::command]
fn update_discord_presence(
  state: State<'_, DiscordState>,
  details: String,
  state_text: String,
  large_image: String,
  large_text: String,
  start_timestamp: Option<u64>,
) -> Result<(), String> {
  let mut client_lock = state.0.lock().unwrap();
  
  if client_lock.is_none() {
    let mut client = Client::new(123456789012345678); // Replace with actual Client ID
    client.start();
    *client_lock = Some(client);
  }

  if let Some(client) = client_lock.as_mut() {
    let mut activity = discord_rpc_client::models::Activity::new()
      .details(&details)
      .state(&state_text)
      .assets(discord_rpc_client::models::Assets::new()
        .large_image(&large_image)
        .large_text(&large_text));
    
    if let Some(ts) = start_timestamp {
      activity = activity.timestamps(discord_rpc_client::models::Timestamps::new().start(ts));
    }

    client.set_activity(|_| activity).map_err(|e| e.to_string())?;
  }

  Ok(())
}

#[tauri::command]
fn clear_discord_presence(state: State<'_, DiscordState>) -> Result<(), String> {
  let mut client_lock = state.0.lock().unwrap();
  if let Some(client) = client_lock.as_mut() {
    client.clear_activity().map_err(|e| e.to_string())?;
  }
  Ok(())
}

fn main() {
  tauri::Builder::default()
    .manage(DiscordState(Arc::new(Mutex::new(None))))
    .invoke_handler(tauri::generate_handler![
      update_discord_presence,
      clear_discord_presence
    ])
    .setup(|app| {
      #[cfg(debug_assertions)]
      {
        let window = app.get_window("main").unwrap();
        window.open_devtools();
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
