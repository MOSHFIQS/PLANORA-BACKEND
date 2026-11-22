import Stripe from "stripe";
import { envVars } from "./env.config";

export const stripe = new Stripe(envVars.STRIPE_SECRET_KEY);
