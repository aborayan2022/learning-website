import { useEffect, useState } from 'react';
import { subscriptionService } from '../../core/services/subscription.service';
import { useAuthStore } from '../../store/auth.store';
import type {
  SubscriptionPlan,
  TeacherSubscription,
} from '../../core/models/subscription.model';
import { Check, Loader2, Star, Zap, Crown } from 'lucide-react';
import { notificationService } from '../../core/services/notification.service';

const PLAN_ICONS: Record<string, React.ReactNode> = {
  free: <Star className="w-8 h-8 text-gray-400" />,
  basic: <Zap className="w-8 h-8 text-blue-500" />,
  premium: <Crown className="w-8 h-8 text-yellow-500" />,
};

export default function SubscriptionPlansPage() {
  const { isAuthenticated } = useAuthStore();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSub, setCurrentSub] = useState<TeacherSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    Promise.all([
      subscriptionService.getPlans(),
      isAuthenticated ? subscriptionService.getCurrentSubscription().catch(() => null) : Promise.resolve(null),
    ])
      .then(([p, s]) => {
        setPlans(p);
        setCurrentSub(s);
      })
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const handleSubscribe = async (planId: number) => {
    setSubscribing(true);
    try {
      await subscriptionService.subscribe(planId, 'monthly');
      notificationService.success('Subscribed successfully!');
      const sub = await subscriptionService.getCurrentSubscription();
      setCurrentSub(sub);
    } catch {
      notificationService.error('Failed to subscribe');
    } finally {
      setSubscribing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="font-['Source_Sans_Pro'] font-bold text-4xl text-[#131313] mb-3">
          Choose Your Plan
        </h1>
        <p className="text-gray-500 font-['Poppins'] text-lg max-w-xl mx-auto">
          Unlock premium features to grow your teaching business
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrent = currentSub?.plan_id === plan.id;
          const slug = plan.slug || plan.name.toLowerCase();
          return (
            <div
              key={plan.id}
              className={`relative bg-white border rounded-2xl p-8 flex flex-col transition ${
                slug === 'premium'
                  ? 'border-yellow-400 ring-2 ring-yellow-200 shadow-lg'
                  : 'border-gray-200 hover:shadow-md'
              }`}
            >
              {slug === 'premium' && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-xs font-bold px-4 py-1 rounded-full">
                  MOST POPULAR
                </div>
              )}

              <div className="mb-6">
                {PLAN_ICONS[slug] || PLAN_ICONS.free}
                <h2 className="font-['Poppins'] font-bold text-2xl text-[#131313] mt-4">
                  {plan.name}
                </h2>
                <div className="mt-2">
                  <span className="text-4xl font-bold text-[#131313]">
                    {plan.monthly_price}
                  </span>
                  <span className="text-gray-400 ml-1">EGP/mo</span>
                </div>
                {plan.annual_price && (
                  <p className="text-sm text-gray-400 mt-1">
                    or {plan.annual_price} EGP/year (save {Math.round((1 - plan.annual_price / (plan.monthly_price * 12)) * 100)}%)
                  </p>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-3 flex-1 mb-6">
                {plan.features &&
                  Object.entries(plan.features).map(([key, val]) => (
                    <li key={key} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                      <span className="text-sm text-gray-600">
                        {key.replace(/_/g, ' ')}: {String(val)}
                      </span>
                    </li>
                  ))}
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-gray-600">
                    Commission: {plan.commission_rate}%
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-gray-600">
                    Max listings: {plan.max_subjects === -1 ? 'Unlimited' : plan.max_subjects}
                  </span>
                </li>
              </ul>

              {/* CTA */}
              {isCurrent ? (
                <button
                  disabled
                  className="w-full py-3 rounded-lg bg-green-100 text-green-700 font-['Poppins'] font-semibold"
                >
                  Current Plan
                </button>
              ) : (
                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={subscribing || !isAuthenticated}
                  className={`w-full py-3 rounded-lg font-['Poppins'] font-semibold transition disabled:opacity-50 ${
                    slug === 'premium'
                      ? 'bg-[#131313] text-white hover:bg-gray-800'
                      : 'bg-gray-100 text-[#131313] hover:bg-gray-200'
                  }`}
                >
                  {!isAuthenticated ? 'Login to Subscribe' : 'Choose Plan'}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
