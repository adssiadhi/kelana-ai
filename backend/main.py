# Ask the user for trip details
destination     = input("Destination : ")
country         = input("Country : ")
days            = int(input("Days : "))
budget          = float(input("Budget : "))
currency        = input("Currency : ")
travel_month    = input("Month of Travel : ")


    
def print_trip_summary(destination, country, days, budget, currency, travel_month):
    print()
    print()
    print("========================")
    print("KelanaAI")
    print("========================")
    print(f"Destination     : {destination}")
    print(f"country         : {country}")
    print(f"Days            : {days}")
    print(f"Budget          : {budget} {currency}")
    print(f"Currency        : {currency}")
    print(f"Month of Travel : {travel_month}")

# Call it with any trip
print_trip_summary(destination, country, days, budget, currency, travel_month)

