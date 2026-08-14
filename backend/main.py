from services.trip_service import calculate_daily_budget,get_trip_category, get_transportation_recommendation, get_travel_season, get_recommended_places

# Ask the user for trip details
destination     = input("Destination : ")
# country         = input("Country : ")
days            = int(input("Days : "))
budget          = float(input("Budget : "))
# currency        = input("Currency : ")
travel_month    = input("Month of Travel : ")


def print_recommended_places(destinations):
    print("Recommended Places")

    for destination in destinations:
        print(destination)

        for place in get_recommended_places(destination):
            print(f"- {place}")

        print()

    
def print_trip_summary(destination, days, budget, travel_month):
    daily = calculate_daily_budget(budget,days)
    category = get_trip_category(budget)
    transportation = get_transportation_recommendation(category)
    season = get_travel_season(travel_month)

    print()
    print()
    print("================================================")
    print("KelanaAI")
    print("================================================")
    print(f"Destination                 : {destination}")
    print(f"Days                        : {days}")
    print(f"Budget                      : {budget} USD")
    print(f"Category                    : {category}")
    print(f"Daily Budget                : {daily}")
    print(f"Month of Travel             : {travel_month}")
    print(f"Season                      : {season}")
    print(f"Recomended Transportation   : {transportation}")
    print()
    print_recommended_places([destination])
    


print_trip_summary(destination, days, budget, travel_month)

# print(f"{category} · {daily} USD/day")# Call it with any trip


