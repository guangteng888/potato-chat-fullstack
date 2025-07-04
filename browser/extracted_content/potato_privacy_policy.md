📄  Extracted from page
: ```json
{
  "file_name": "potato_privacy_policy.md",
  "privacy_policy": {
    "data_sharing_policies": {
      "general_policy": "We never share your data with anyone. No.",
      "third_party_sharing": "Potato explicitly states they never share user data with third parties"
    },
    "encryption_methods": {
      "cloud_chats": {
        "encryption": "All data is stored heavily encrypted",
        "key_storage": "Encryption keys are stored in several other data centers in different jurisdictions to prevent local engineers or physical intruders from accessing user data"
      },
      "secret_chats": {
        "encryption_type": "End-to-end encryption",
        "key_access": "Data is encrypted with a key that only you and the recipient know",
        "server_access": "No way for Potato or anybody else without direct access to your device to learn what content is being sent"
      },
      "media_in_secret_chats": {
        "file_encryption": "Each item is encrypted with a separate key, not known to the server",
        "double_encryption": "The key and file location are encrypted again with the secret chat's key",
        "server_perspective": "Files appear as random indecipherable garbage to everyone except sender and recipient"
      }
    },
    "storage_practices": {
      "cloud_chats": {
        "location": "Messages, photos, videos and documents stored on Potato servers",
        "purpose": "To access data from any device and enable instant server search",
        "accessibility": "Available across all user devices"
      },
      "secret_chats": {
        "server_storage": "Secret chats are NOT stored on servers",
        "accessibility": "Only accessible from the device they were sent to or from",
        "cloud_availability": "Not available in the cloud"
      },
      "contacts": {
        "data_stored": "Only phone number and name (first and last)",
        "purpose": "To notify when contacts sign up and display names in notifications",
        "permission": "Permission requested before syncing contacts"
      },
      "email_addresses": {
        "usage": "Only used for password recovery when 2-step verification is enabled",
        "restrictions": "No marketing or promotional emails"
      },
      "logs": {
        "secret_chats": "No logs kept for secret chat messages",
        "retention": "After a short period, Potato no longer knows who or when you messaged via secret chats"
      }
    },
    "data_deletion_policies": {
      "regular_messages": {
        "user_deletion": "When you delete a message, it's removed from your message history but remains in partner's history until they also delete it",
        "permanent_deletion": "Once both parties delete, the message is gone forever",
        "exception": "Humorous note: 'We never delete your funny cat pictures, we love them too much'"
      },
      "self_destructing_messages": {
        "mechanism": "Messages in Secret Chats can be set to self-destruct",
        "trigger": "Countdown starts when message is read (2 checks appear)",
        "execution": "Both devices are instructed to delete the message when time expires"
      },
      "account_self_destruction": {
        "timeframe": "Accounts are deleted if inactive for at least 6 months",
        "scope": "Deletion includes all messages, media, contacts and every other piece of data in Potato cloud",
        "user_control": "Users can change the self-destruction period in Settings"
      },
      "media_purging": {
        "encrypted_media": "Random encrypted data from secret chats is periodically purged from servers to save disk space"
      }
    },
    "security_features": {
      "geographic_distribution": "Encryption keys stored across multiple data centers in different jurisdictions",
      "access_control": "Local engineers and physical intruders cannot access user data",
      "two_step_verification": "Available with optional email recovery setup"
    }
  }
}
```
