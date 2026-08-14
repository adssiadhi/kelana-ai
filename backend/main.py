from services.trip_service import calculate_daily_budget,get_trip_category, get_transportation_recommendation, get_travel_season, get_recommended_places

# Ask the user for trip details
destination_input = input("Destination (separate with comma) : ")
#  bonus
destination_parts = destination_input.split(",")
destination = []
index = 0

while index < len(destination_parts):
    item = destination_parts[index].strip()
    if item != "":
        destination.append(item)
    index += 1

# country         = input("Country : ")
days            = int(input("Days : "))
budget          = float(input("Budget : "))
# currency        = input("Currency : ")
travel_month    = input("Month of Travel : ")


def format_destinations(destinations):
    if isinstance(destinations, str):
        destinations = [destinations]

    formatted_destinations = []
    index = 0

    while index < len(destinations):
        formatted_destinations.append(f"{index + 1}. {destinations[index]}")
        index += 1

    return " ".join(formatted_destinations)


def print_recommended_places(destinations):
    if isinstance(destinations, str):
        destinations = [destinations]

    print("Recommended Places")
    print()

    destination_index = 0

    while destination_index < len(destinations):
        destination = destinations[destination_index]
        print(destination)

        places = get_recommended_places(destination)
        place_index = 0

        while place_index < len(places):
            print(f"- {places[place_index]}")
            place_index += 1

        print()
        destination_index += 1


def print_trip_summary(destination, days, budget, travel_month):
    if isinstance(destination, str):
        destination = [destination]

    daily = calculate_daily_budget(budget,days)
    category = get_trip_category(budget)
    transportation = get_transportation_recommendation(category)
    season = get_travel_season(travel_month)

    print()
    print()
    print("================================================")
    print("KelanaAI")
    print("================================================")
    print(f"Destination                 : {format_destinations(destination)}")
    print(f"Days                        : {days}")
    print(f"Budget                      : {budget} USD")
    print(f"Category                    : {category}")
    print(f"Daily Budget                : {daily}")
    print(f"Month of Travel             : {travel_month}")
    print(f"Season                      : {season}")
    print(f"Recomended Transportation   : {transportation}")
    print()
    print_recommended_places(destination)


print_trip_summary(destination, days, budget, travel_month)