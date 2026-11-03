class BeneficiaryRepository:
    def __init__(self, beneficiaries):
        self._items = list(beneficiaries)

    def get(self, beneficiary_id):
        for beneficiary in self._items:
            if beneficiary.beneficiary_id == beneficiary_id:
                return beneficiary
        return None

    def all(self):
        return list(self._items)

    def active(self):
        return [beneficiary for beneficiary in self._items if beneficiary.active]

    def for_household(self, household_id):
        return [beneficiary for beneficiary in self._items if beneficiary.household_id == household_id]
