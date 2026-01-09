import json
import os
import boto3

def handle_subscribe(email, contact_list_name):
    ses_v2 = boto3.client('sesv2')
    try:
        ses_v2.create_contact(
            ContactListName=contact_list_name,
            EmailAddress=email,
            TopicPreferences=[
                {
                    'TopicName': 'daily-challenge',
                    'SubscriptionStatus': 'OPT_IN'
                }
            ]
        )
        return {
            "statusCode": 200,
            "body": json.dumps({"message": "Subscribed successfully"})
        }
    except ses_v2.exceptions.AlreadyExistsException:
         return {
            "statusCode": 200, # Treat duplicate as success for UX
            "body": json.dumps({"message": "Already subscribed"})
        }
    except Exception as e:
        print(f"Error creating contact: {e}")
        return {
            "statusCode": 500,
            "body": json.dumps({"error": "Failed to subscribe"})
        }

def handle_unsubscribe(email, contact_list_name):
    ses_v2 = boto3.client('sesv2')
    try:
        ses_v2.delete_contact(
            ContactListName=contact_list_name,
            EmailAddress=email
        )
        return {
            "statusCode": 200,
            "body": json.dumps({"message": "Unsubscribed successfully"})
        }
    except ses_v2.exceptions.NotFoundException:
        return {
            "statusCode": 200, # Treat not found as success
            "body": json.dumps({"message": "Unsubscribed successfully"})
        }
    except Exception as e:
        print(f"Error deleting contact: {e}")
        return {
            "statusCode": 500,
            "body": json.dumps({"error": "Failed to unsubscribe"})
        }

def handle_scheduled_notification(contact_list_name, sender_email, public_url):
    ses_v2 = boto3.client('sesv2')
    ses = boto3.client('ses')
    
    # List all contacts (pagination logic omitted for MVP, assumes list < 1000 or simple use case)
    # For production, use ListContacts paginator and filter by TopicPreferences
    
    contacts = []
    try:
        next_token = None
        while True:
            kwargs = {
                'ContactListName': contact_list_name,
                'Filter': {
                    'FilteredStatus': 'OPT_IN',
                    'TopicFilter': {
                        'TopicName': 'daily-challenge',
                        'UseDefaultIfPreferenceUnavailable': True
                    }
                }
            }
            if next_token:
                kwargs['NextToken'] = next_token

            response = ses_v2.list_contacts(**kwargs)
            
            for contact in response.get('Contacts', []):
                 if contact.get('UnsubscribeAll', False):
                     continue
                 contacts.append(contact['EmailAddress'])
            
            next_token = response.get('NextToken')
            if not next_token:
                break
                 
    except Exception as e:
        print(f"Error listing contacts: {e}")
        return

    print(f"Sending to {len(contacts)} recipients")
    
    success_count = 0
    fail_count = 0

    for email in contacts:
        unsubscribe_link = f"{public_url}?action=unsubscribe&email={email}"
        
        try:
            ses.send_templated_email(
                Source=sender_email,
                Destination={
                    'ToAddresses': [email]
                },
                Template='fakeout-new-game',
                TemplateData=json.dumps({'unsubscribe_link': unsubscribe_link})
            )
            success_count += 1
        except Exception as e:
            print(f"Failed to send to {email}: {e}")
            fail_count += 1
            
    print(f"Sent {success_count} emails, failed {fail_count}")


def handler(event, context):
    contact_list_name = os.environ.get("CONTACT_LIST_NAME")
    sender_email = os.environ.get("SENDER_EMAIL")
    
    # Try to get public_url from env (local testing) or event (scheduler)
    public_url = os.environ.get("PUBLIC_URL")
    if not public_url:
        public_url = event.get('public_url')

    # API Gateway / Function URL Event
    if 'requestContext' in event and 'http' in event['requestContext']:
        method = event['requestContext']['http']['method']
        query_params = event.get('queryStringParameters', {})
        
        # We can construct public_url from the request if missing
        if not public_url and 'domainName' in event['requestContext']:
             public_url = f"https://{event['requestContext']['domainName']}"

        if method == 'POST':
            try:
                body = json.loads(event.get('body', '{}'))
                email = body.get('email')
                if not email:
                     return {"statusCode": 400, "body": json.dumps({"error": "Email required"})}
                return handle_subscribe(email, contact_list_name)
            except Exception as e:
                return {"statusCode": 400, "body": json.dumps({"error": "Invalid request"})}
        
        if method == 'GET' and query_params.get('action') == 'unsubscribe':
             email = query_params.get('email')
             if email:
                 # Minimal HTML response for unsubscribe landing page
                 handle_unsubscribe(email, contact_list_name)
                 return {
                     "statusCode": 200,
                     "headers": {"Content-Type": "text/html"},
                     "body": "<html><body><h1>Unsubscribed</h1><p>You have been successfully unsubscribed from FakeOut notifications.</p></body></html>"
                 }

    # Scheduled Event (EventBridge)
    # Check for 'detail-type': 'Scheduled Event' or presence of 'public_url' input
    if event.get('detail-type') == 'Scheduled Event' or event.get('public_url'):
         if not public_url:
             print("Error: Public URL not found in event for scheduled execution")
             return {"statusCode": 500, "body": "Configuration error: Missing Public URL"}
             
         handle_scheduled_notification(contact_list_name, sender_email, public_url)
         return {"statusCode": 200, "body": "Scheduled execution completed"}

    return {"statusCode": 404, "body": "Not found"}
