from supabase_client import supabase


print("Testing Supabase connection...")


result = (
    supabase
    .table("profiles")
    .select("*")
    .limit(1)
    .execute()
)


print("Supabase connection successful!")
print("Database response:")
print(result.data)