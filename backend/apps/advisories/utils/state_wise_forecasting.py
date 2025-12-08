import pandas as pd

def load_and_clean_data(path):
    df = pd.read_csv(path)

    # Convert date to datetime
    df['date'] = pd.to_datetime(df['date'], dayfirst=True)

    # Normalize numerical fields
    numeric_cols = [
        "total_quantity_ordered", "total_value_inr", "price_per_quintal_inr",
        "processor_demand", "modal_price_inr", "arrival_quantity_quintals",
        "bid_quantity_quintals", "bid_count_x", "view_count",
        "bid_count_y", "lots_quantity_listed"
    ]
    df[numeric_cols] = df[numeric_cols].apply(pd.to_numeric, errors='coerce')

    return df



def state_price_forecast(df):
    df['price_gap'] = df['price_per_quintal_inr'] - df['modal_price_inr']

    # Forecast price movement direction
    df['price_trend'] = df.apply(
        lambda x: "Likely to increase" if x['arrival_quantity_quintals'] < x['processor_demand']
        else "Stable/Decrease",
        axis=1
    )

    # State-level predicted best price
    state_price = df.groupby(['crop_type','state'])['price_per_quintal_inr'].mean()
    state_price = state_price.reset_index().rename(columns={"price_per_quintal_inr": "forecasted_state_price"})

    return df, state_price
