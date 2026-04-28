import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Gift, Calendar, Check, DollarSign, Trophy } from 'lucide-react';

interface Reward {
  id: string;
  voucher_code: string;
  amount: number;
  reason: string | null;
  earned_date: string;
  expiry_date: string | null;
  is_redeemed: boolean;
  photo_id?: string;
}

export function RewardsPage() {
  const { user } = useAuth();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalEarned, setTotalEarned] = useState(0);
  const [availableBalance, setAvailableBalance] = useState(0);

  useEffect(() => {
    if (user) {
      loadRewards();
    }
  }, [user]);

  const loadRewards = () => {
    const localRewards: Reward[] = JSON.parse(
      localStorage.getItem('rewards') || '[]'
    );

    setRewards(localRewards);

    const total = localRewards.reduce(
      (sum, reward) => sum + Number(reward.amount),
      0
    );

    const available = localRewards
      .filter((reward) => !reward.is_redeemed)
      .reduce((sum, reward) => sum + Number(reward.amount), 0);

    setTotalEarned(total);
    setAvailableBalance(available);
    setLoading(false);
  };

  const handleRedeem = (rewardId: string) => {
    const updatedRewards = rewards.map((reward) =>
      reward.id === rewardId
        ? { ...reward, is_redeemed: true }
        : reward
    );

    localStorage.setItem('rewards', JSON.stringify(updatedRewards));
    setRewards(updatedRewards);

    const total = updatedRewards.reduce(
      (sum, reward) => sum + Number(reward.amount),
      0
    );

    const available = updatedRewards
      .filter((reward) => !reward.is_redeemed)
      .reduce((sum, reward) => sum + Number(reward.amount), 0);

    setTotalEarned(total);
    setAvailableBalance(available);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-8 flex items-center">
        <Gift className="w-8 h-8 mr-3 text-blue-600" />
        My Rewards
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <Trophy className="w-8 h-8" />
            <span className="text-sm opacity-90">Total Earned</span>
          </div>
          <p className="text-4xl font-bold">₹{totalEarned.toFixed(2)}</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-8 h-8" />
            <span className="text-sm opacity-90">Available Balance</span>
          </div>
          <p className="text-4xl font-bold">₹{availableBalance.toFixed(2)}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <Gift className="w-8 h-8" />
            <span className="text-sm opacity-90">Total Vouchers</span>
          </div>
          <p className="text-4xl font-bold">{rewards.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Reward History</h3>

        {rewards.length === 0 ? (
          <div className="text-center py-12">
            <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">No rewards yet</p>
            <p className="text-gray-400">
              Upload photos and get high ratings to earn reward vouchers!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {rewards.map((reward) => (
              <div
                key={reward.id}
                className={`border-2 rounded-xl p-6 transition ${
                  reward.is_redeemed
                    ? 'border-gray-200 bg-gray-50'
                    : 'border-green-200 bg-green-50 hover:shadow-md'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-mono font-semibold">
                        {reward.voucher_code}
                      </span>

                      {reward.is_redeemed && (
                        <span className="flex items-center text-green-600 text-sm font-semibold">
                          <Check className="w-4 h-4 mr-1" />
                          Redeemed
                        </span>
                      )}
                    </div>

                    <p className="text-gray-700 mb-2">
                      {reward.reason || 'Reward voucher'}
                    </p>

                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        Earned: {new Date(reward.earned_date).toLocaleDateString()}
                      </span>

                      {reward.expiry_date && (
                        <span>
                          Expires: {new Date(reward.expiry_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-3xl font-bold text-green-600">
                      ₹{Number(reward.amount).toFixed(2)}
                    </p>

                    {!reward.is_redeemed && (
                      <button
                        onClick={() => handleRedeem(reward.id)}
                        className="mt-2 bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
                      >
                        Use Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h4 className="text-lg font-bold text-blue-800 mb-3">
          How to Earn More Rewards
        </h4>

        <ul className="space-y-2 text-blue-700">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Upload your travel photos to the gallery</span>
          </li>

          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Rate your photos with 4 or 5 stars</span>
          </li>

          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Earn ₹100 for 4-star ratings and ₹200 for 5-star ratings</span>
          </li>
        </ul>
      </div>
    </div>
  );
}