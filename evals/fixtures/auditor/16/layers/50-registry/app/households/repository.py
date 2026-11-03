class HouseholdRepository:
    def __init__(self, households):
        self._by_id = {household.household_id: household for household in households}

    def get(self, household_id):
        return self._by_id.get(household_id)

    def all(self):
        return list(self._by_id.values())
