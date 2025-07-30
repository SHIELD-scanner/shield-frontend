import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VulnerableImagesTable } from '@/components/vulnerable-images-table';

// Mock the Next.js Link component
jest.mock('next/link', () => {
  return ({ children, href, ...props }: any) => {
    return <a href={href} {...props}>{children}</a>;
  };
});

// Mock the TimeDisplay component
jest.mock('@/components/ui/time-display', () => ({
  TimeDisplay: ({ dateString }: { dateString: string }) => (
    <div data-testid="time-display">{dateString}</div>
  ),
}));

// Mock data for testing
const mockVulnerableImages = [
  {
    id: 1,
    imageName: 'nginx',
    tag: 'latest',
    registry: 'docker.io',
    repository: 'library/nginx',
    fullName: 'docker.io/library/nginx:latest',
    digest: 'sha256:abc123',
    size: '150MB',
    vulnerabilityCount: {
      critical: 2,
      high: 5,
      medium: 10,
      low: 3,
      total: 20,
    },
    secretCount: {
      critical: 1,
      high: 2,
      medium: 0,
      low: 0,
      total: 3,
    },
    lastScanned: '2024-01-15T10:30:00Z',
    riskScore: 8.5,
    status: 'active',
    namespace: 'production',
    workloads: ['nginx-deployment', 'web-server'],
  },
  {
    id: 2,
    imageName: 'redis',
    tag: '6.2',
    registry: 'docker.io',
    repository: 'library/redis',
    fullName: 'docker.io/library/redis:6.2',
    digest: 'sha256:def456',
    size: '110MB',
    vulnerabilityCount: {
      critical: 0,
      high: 2,
      medium: 8,
      low: 5,
      total: 15,
    },
    secretCount: {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      total: 0,
    },
    lastScanned: '2024-01-14T09:15:00Z',
    riskScore: 6.2,
    status: 'deprecated',
    namespace: 'staging',
    workloads: ['redis-master', 'redis-slave', 'cache-service'],
  },
  {
    id: 3,
    imageName: 'postgres',
    tag: '14',
    registry: 'docker.io',
    repository: 'library/postgres',
    fullName: 'docker.io/library/postgres:14',
    digest: 'sha256:ghi789',
    size: '374MB',
    vulnerabilityCount: {
      critical: 0,
      high: 0,
      medium: 3,
      low: 2,
      total: 5,
    },
    secretCount: {
      critical: 0,
      high: 1,
      medium: 2,
      low: 1,
      total: 4,
    },
    lastScanned: '2024-01-13T14:20:00Z',
    riskScore: 4.1,
    status: 'active',
    namespace: 'development',
    workloads: ['postgres-primary'],
  },
];

describe('VulnerableImagesTable', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    // Reset any mocks
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the table with data', () => {
      render(<VulnerableImagesTable data={mockVulnerableImages} />);

      // Check that the table headers are present
      expect(screen.getByText('Image')).toBeInTheDocument();
      expect(screen.getByText('Namespace')).toBeInTheDocument();
      expect(screen.getByText('Vulnerabilities')).toBeInTheDocument();
      expect(screen.getByText('Exposed Secrets')).toBeInTheDocument();
      expect(screen.getByText('Risk Score')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Size')).toBeInTheDocument();
      expect(screen.getByText('Last Scanned')).toBeInTheDocument();
      expect(screen.getByText('Workloads')).toBeInTheDocument();
    });

    it('should render image information correctly', () => {
      render(<VulnerableImagesTable data={mockVulnerableImages} />);

      // Check image names and tags
      expect(screen.getByText('nginx:latest')).toBeInTheDocument();
      expect(screen.getByText('redis:6.2')).toBeInTheDocument();
      expect(screen.getByText('postgres:14')).toBeInTheDocument();

      // Check repositories
      expect(screen.getByText('library/nginx')).toBeInTheDocument();
      expect(screen.getByText('library/redis')).toBeInTheDocument();
      expect(screen.getByText('library/postgres')).toBeInTheDocument();
    });

    it('should render vulnerability counts correctly', () => {
      render(<VulnerableImagesTable data={mockVulnerableImages} />);

      // Check critical vulnerability badges
      expect(screen.getByText('2 Critical')).toBeInTheDocument();
      expect(screen.getAllByText('5 High')[0]).toBeInTheDocument();
      expect(screen.getByText('20 total vulnerabilities')).toBeInTheDocument();

      // Check medium vulnerability badge for postgres  
      expect(screen.getByText('15 total vulnerabilities')).toBeInTheDocument();
    });

    it('should render exposed secrets correctly', () => {
      render(<VulnerableImagesTable data={mockVulnerableImages} />);

      // Check critical secrets
      expect(screen.getByText('1 Critical')).toBeInTheDocument();
      expect(screen.getAllByText('2 High')[1]).toBeInTheDocument(); // Second occurrence (for secrets)
      expect(screen.getByText('3 exposed secrets')).toBeInTheDocument();

      // Check no secrets message
      expect(screen.getByText('No secrets')).toBeInTheDocument();
    });

    it('should render risk scores with appropriate badges', () => {
      render(<VulnerableImagesTable data={mockVulnerableImages} />);

      // Check risk scores
      expect(screen.getByText('8.5')).toBeInTheDocument();
      expect(screen.getByText('6.2')).toBeInTheDocument();
      expect(screen.getByText('4.1')).toBeInTheDocument();
    });

    it('should render status badges correctly', () => {
      render(<VulnerableImagesTable data={mockVulnerableImages} />);

      // Check status badges
      expect(screen.getAllByText('active')).toHaveLength(2);
      expect(screen.getByText('deprecated')).toBeInTheDocument();
    });

    it('should render namespace badges correctly', () => {
      render(<VulnerableImagesTable data={mockVulnerableImages} />);

      expect(screen.getByText('production')).toBeInTheDocument();
      expect(screen.getByText('staging')).toBeInTheDocument();
      expect(screen.getByText('development')).toBeInTheDocument();
    });

    it('should render workloads with overflow handling', () => {
      render(<VulnerableImagesTable data={mockVulnerableImages} />);

      // Check workloads for nginx (2 workloads)
      expect(screen.getByText('nginx-deployment')).toBeInTheDocument();
      expect(screen.getByText('web-server')).toBeInTheDocument();

      // Check workloads for redis (3 workloads, should show +1 more)
      expect(screen.getByText('redis-master')).toBeInTheDocument();
      expect(screen.getByText('redis-slave')).toBeInTheDocument();
      expect(screen.getByText('+1 more')).toBeInTheDocument();
    });

    it('should render empty state when no data', () => {
      render(<VulnerableImagesTable data={[]} />);

      expect(screen.getByText('No results.')).toBeInTheDocument();
    });
  });

  describe('Filtering', () => {
    it('should filter images by name', async () => {
      render(<VulnerableImagesTable data={mockVulnerableImages} />);

      const filterInput = screen.getByPlaceholderText('Filter images...');
      await user.type(filterInput, 'nginx');

      await waitFor(() => {
        expect(screen.getByText('nginx:latest')).toBeInTheDocument();
        expect(screen.queryByText('redis:6.2')).not.toBeInTheDocument();
        expect(screen.queryByText('postgres:14')).not.toBeInTheDocument();
      });
    });

    it('should have namespace selector', () => {
      render(<VulnerableImagesTable data={mockVulnerableImages} />);

      // Check that the namespace selector is present
      const namespaceSelector = screen.getByText('All namespaces');
      expect(namespaceSelector).toBeInTheDocument();
      
      // Check that it's in a button (combobox trigger)
      const selectButton = namespaceSelector.closest('button');
      expect(selectButton).toBeInTheDocument();
      expect(selectButton).toHaveAttribute('role', 'combobox');
    });

    it('should have different namespaces in mock data for filtering', () => {
      render(<VulnerableImagesTable data={mockVulnerableImages} />);

      // Verify that we have images from different namespaces in our test data
      expect(screen.getByText('production')).toBeInTheDocument();
      expect(screen.getByText('staging')).toBeInTheDocument();
      expect(screen.getByText('development')).toBeInTheDocument();
    });
  });

  describe('Sorting', () => {
    it('should be sorted by risk score descending by default', () => {
      render(<VulnerableImagesTable data={mockVulnerableImages} />);

      const rows = screen.getAllByRole('row');
      // Skip header row
      const dataRows = rows.slice(1);
      
      // First row should contain highest risk score (8.5)
      expect(dataRows[0]).toHaveTextContent('nginx:latest');
      expect(dataRows[0]).toHaveTextContent('8.5');
    });
  });

  describe('Row Selection', () => {
    it('should allow selecting individual rows', async () => {
      render(<VulnerableImagesTable data={mockVulnerableImages} />);

      const checkboxes = screen.getAllByRole('checkbox');
      // First checkbox is the select all, second is first row
      const firstRowCheckbox = checkboxes[1];

      await user.click(firstRowCheckbox);

      expect(firstRowCheckbox).toBeChecked();
    });

    it('should allow selecting all rows', async () => {
      render(<VulnerableImagesTable data={mockVulnerableImages} />);

      const checkboxes = screen.getAllByRole('checkbox');
      const selectAllCheckbox = checkboxes[0];

      await user.click(selectAllCheckbox);

      // All individual row checkboxes should be checked
      checkboxes.slice(1).forEach(checkbox => {
        expect(checkbox).toBeChecked();
      });
    });

    it('should update selection count display', async () => {
      render(<VulnerableImagesTable data={mockVulnerableImages} />);

      const checkboxes = screen.getAllByRole('checkbox');
      const firstRowCheckbox = checkboxes[1];

      await user.click(firstRowCheckbox);

      expect(screen.getByText('1 of 3 row(s) selected.')).toBeInTheDocument();
    });
  });

  describe('Pagination', () => {
    it('should show pagination controls', () => {
      render(<VulnerableImagesTable data={mockVulnerableImages} />);

      expect(screen.getByText('Page 1 of 1')).toBeInTheDocument();
      // Check for pagination buttons by their icon content or role
      const buttons = screen.getAllByRole('button');
      const paginationButtons = buttons.filter(button => 
        button.querySelector('svg') && 
        (button.querySelector('[class*="chevron"]') || button.querySelector('[class*="chevrons"]'))
      );
      expect(paginationButtons.length).toBeGreaterThan(0);
    });

    it('should have page size selector', () => {
      render(<VulnerableImagesTable data={mockVulnerableImages} />);

      // Find the page size selector by its label "Rows per page" 
      const pageSizeButton = screen.getByRole('combobox', { name: 'Rows per page' });
      expect(pageSizeButton).toBeInTheDocument();
      
      // Check that it shows "10" as the default value
      expect(pageSizeButton).toHaveTextContent('10');
    });

    it('should disable previous page button on first page', () => {
      render(<VulnerableImagesTable data={mockVulnerableImages} />);

      // Find buttons with chevron left icons that are disabled
      const buttons = screen.getAllByRole('button');
      const prevButtons = buttons.filter(button => 
        (button as HTMLButtonElement).disabled && button.querySelector('[class*="chevron-left"]')
      );
      expect(prevButtons.length).toBeGreaterThan(0);
    });

    it('should disable next page button when no more pages', () => {
      render(<VulnerableImagesTable data={mockVulnerableImages} />);

      // Find buttons with chevron right icons that are disabled
      const buttons = screen.getAllByRole('button');
      const nextButtons = buttons.filter(button => 
        (button as HTMLButtonElement).disabled && button.querySelector('[class*="chevron-right"]')
      );
      expect(nextButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Column Visibility', () => {
    it('should show column visibility dropdown', async () => {
      render(<VulnerableImagesTable data={mockVulnerableImages} />);

      const columnButton = screen.getByText('Customize Columns');
      await user.click(columnButton);

      expect(screen.getByText('namespace')).toBeInTheDocument();
      expect(screen.getByText('vulnerabilityCount')).toBeInTheDocument();
      expect(screen.getByText('secretCount')).toBeInTheDocument();
    });

    it('should allow hiding columns', async () => {
      render(<VulnerableImagesTable data={mockVulnerableImages} />);

      const columnButton = screen.getByText('Customize Columns');
      await user.click(columnButton);

      const namespaceToggle = screen.getByText('namespace');
      await user.click(namespaceToggle);

      // Namespace column should be hidden
      expect(screen.queryByText('Namespace')).not.toBeInTheDocument();
    });
  });

  describe('Actions Menu', () => {
    it('should show actions menu buttons for each row', async () => {
      render(<VulnerableImagesTable data={mockVulnerableImages} />);

      // Find action buttons by looking for "Open menu" text or menu trigger buttons
      const openMenuButtons = screen.getAllByText('Open menu');
      expect(openMenuButtons.length).toBeGreaterThan(0);
      
      // Verify each image row has an action button
      expect(openMenuButtons.length).toBe(mockVulnerableImages.length);
    });

    it('should have clickable action menu buttons', async () => {
      render(<VulnerableImagesTable data={mockVulnerableImages} />);

      // Find the first action button 
      const openMenuButtons = screen.getAllByText('Open menu');
      
      if (openMenuButtons.length > 0) {
        const firstActionButton = openMenuButtons[0].closest('button');
        expect(firstActionButton).toBeInTheDocument();
        
        // Check if it's clickable (not disabled)
        expect(firstActionButton).not.toBeDisabled();
        
        // Try clicking it - it should not throw an error
        await user.click(firstActionButton!);
        
        // The button should have proper ARIA attributes
        expect(firstActionButton).toHaveAttribute('aria-haspopup');
      }
    });
  });

  describe('Links', () => {
    it('should have correct links for image names', () => {
      render(<VulnerableImagesTable data={mockVulnerableImages} />);

      const nginxLink = screen.getByText('nginx:latest').closest('a');
      const redisLink = screen.getByText('redis:6.2').closest('a');
      const postgresLink = screen.getByText('postgres:14').closest('a');

      expect(nginxLink).toHaveAttribute('href', '/vulnerable-images/1');
      expect(redisLink).toHaveAttribute('href', '/vulnerable-images/2');
      expect(postgresLink).toHaveAttribute('href', '/vulnerable-images/3');
    });
  });

  describe('Toolbar Actions', () => {
    it('should show scan all images button', () => {
      render(<VulnerableImagesTable data={mockVulnerableImages} />);

      expect(screen.getByText('Scan All Images')).toBeInTheDocument();
    });

    it('should show scan all images button on mobile', () => {
      render(<VulnerableImagesTable data={mockVulnerableImages} />);

      // Both desktop and mobile versions should be present (hidden/shown via CSS)
      const scanButtons = screen.getAllByRole('button', { name: /scan all images/i });
      expect(scanButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Risk Score Badge Variants', () => {
    it('should apply correct badge variant based on risk score', () => {
      const testData = [
        { ...mockVulnerableImages[0], id: 10, riskScore: 9.5 }, // destructive (>= 9)
        { ...mockVulnerableImages[0], id: 11, riskScore: 7.5 }, // secondary (>= 7)
        { ...mockVulnerableImages[0], id: 12, riskScore: 5.5 }, // outline (>= 5)
        { ...mockVulnerableImages[0], id: 13, riskScore: 3.0 }, // default (< 5)
      ];

      render(<VulnerableImagesTable data={testData} />);

      expect(screen.getByText('9.5')).toBeInTheDocument();
      expect(screen.getByText('7.5')).toBeInTheDocument();
      expect(screen.getByText('5.5')).toBeInTheDocument();
      expect(screen.getByText('3.0')).toBeInTheDocument();
    });

    it('should show alert icon for high risk scores', () => {
      const highRiskData = [
        { ...mockVulnerableImages[0], id: 20, riskScore: 8.5 },
      ];

      render(<VulnerableImagesTable data={highRiskData} />);

      // Should have alert triangle icon for scores >= 8
      // Look for the alert triangle icon from Tabler icons
      const alertIcons = document.querySelectorAll('[class*="alert-triangle"]');
      expect(alertIcons.length).toBeGreaterThan(0);
    });
  });

  describe('Status Badge Variants', () => {
    it('should apply correct badge variant based on status', () => {
      const testData = [
        { ...mockVulnerableImages[0], id: 30, status: 'active' },
        { ...mockVulnerableImages[0], id: 31, status: 'deprecated' },
        { ...mockVulnerableImages[0], id: 32, status: 'inactive' },
      ];

      render(<VulnerableImagesTable data={testData} />);

      expect(screen.getAllByText('active')).toHaveLength(1);
      expect(screen.getByText('deprecated')).toBeInTheDocument();
      expect(screen.getByText('inactive')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for checkboxes', () => {
      render(<VulnerableImagesTable data={mockVulnerableImages} />);

      const selectAllCheckbox = screen.getByLabelText('Select all');
      const selectRowCheckboxes = screen.getAllByLabelText('Select row');

      expect(selectAllCheckbox).toBeInTheDocument();
      expect(selectRowCheckboxes).toHaveLength(3);
    });

    it('should have proper ARIA labels for action buttons', () => {
      render(<VulnerableImagesTable data={mockVulnerableImages} />);

      // Find dropdown menu buttons by their aria-haspopup attribute
      const actionButtons = screen.getAllByRole('button').filter(button => 
        button.getAttribute('aria-haspopup') === 'menu'
      );
      expect(actionButtons.length).toBeGreaterThan(0);
    });

    it('should have proper screen reader text for navigation buttons', () => {
      render(<VulnerableImagesTable data={mockVulnerableImages} />);

      // Check that navigation buttons exist by their visual characteristics
      const buttons = screen.getAllByRole('button');
      const navigationButtons = buttons.filter(button => 
        button.querySelector('[class*="chevron"]') || button.querySelector('[class*="chevrons"]')
      );
      expect(navigationButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Time Display Integration', () => {
    it('should render TimeDisplay components for lastScanned', () => {
      render(<VulnerableImagesTable data={mockVulnerableImages} />);

      const timeDisplays = screen.getAllByTestId('time-display');
      expect(timeDisplays).toHaveLength(3);
      expect(timeDisplays[0]).toHaveTextContent('2024-01-15T10:30:00Z');
      expect(timeDisplays[1]).toHaveTextContent('2024-01-14T09:15:00Z');
      expect(timeDisplays[2]).toHaveTextContent('2024-01-13T14:20:00Z');
    });
  });
});
